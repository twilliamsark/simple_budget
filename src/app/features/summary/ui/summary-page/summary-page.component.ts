import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { TransactionsService } from '../../../transactions/data-access/transactions.service';
import { CategoriesService } from '../../../../shared/data-access/categories.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';

const WEDGE_COLORS = [
  '#1976d2',
  '#388e3c',
  '#f57c00',
  '#7b1fa2',
  '#c62828',
  '#0097a7',
  '#5d4037',
  '#455a64',
  '#d32f2f',
  '#689f38',
  '#ffa000',
  '#00796b',
  '#e64a19',
  '#303f9f',
  '#616161',
];

@Component({
  selector: 'app-summary-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, BaseChartDirective],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Expense summary by category</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (chartData(); as data) {
          @if ((data.labels?.length ?? 0) === 0) {
            <p class="empty">No expenses to show. Add or import transactions with negative amounts.</p>
          } @else {
            <div class="chart-row">
              <div class="pie-container">
                <canvas
                  baseChart
                  [data]="data"
                  [options]="chartOptions"
                  type="pie"
                  aria-label="Expense pie chart by category"
                ></canvas>
              </div>
            </div>
            <p class="total">Total expenses: {{ formatAmount(totalExpenseCents()) }}</p>
          }
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .empty {
      color: var(--mat-sys-on-surface-variant);
      margin: 1rem 0;
    }
    .chart-row {
      margin: 1rem 0;
    }
    .pie-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .total {
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0;
    }
  `,
})
export default class SummaryPageComponent {
  private readonly transactions = inject(TransactionsService);
  private readonly categories = inject(CategoriesService);

  private readonly fundsTransferCategoryName = 'Funds transfer';

  readonly totalExpenseCents = computed(() => {
    const categories = this.categories.categories();
    return this.transactions
      .transactions()
      .filter((t) => {
        if (t.amount >= 0) return false;
        const name = categories.find((c) => c.id === t.categoryId)?.name ?? '';
        return name.toLowerCase() !== this.fundsTransferCategoryName.toLowerCase();
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  readonly chartData = computed((): ChartConfiguration<'pie'>['data'] => {
    const txList = this.transactions.transactions();
    const categories = this.categories.categories();
    const byCategory = new Map<string, number>();

    for (const t of txList) {
      if (t.amount >= 0) continue;
      const name = categories.find((c) => c.id === t.categoryId)?.name ?? '';
      if (name.toLowerCase() === this.fundsTransferCategoryName.toLowerCase()) continue;
      const abs = Math.abs(t.amount);
      byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + abs);
    }

    const total = this.totalExpenseCents();
    if (total === 0) {
      return { labels: [], datasets: [] };
    }

    const entries = Array.from(byCategory.entries())
      .map(([categoryId, amountCents]) => ({
        categoryId,
        categoryName:
          categories.find((c) => c.id === categoryId)?.name ?? categoryId,
        amountCents,
      }))
      .sort((a, b) => b.amountCents - a.amountCents);

    return {
      labels: entries.map((e) => e.categoryName),
      datasets: [
        {
          data: entries.map((e) => e.amountCents / 100),
          backgroundColor: entries.map(
            (_, i) => WEDGE_COLORS[i % WEDGE_COLORS.length]
          ),
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  });

  chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          generateLabels: (chart) =>
            this.generateLegendLabels(chart as { data: ChartConfiguration<'pie'>['data'] }),
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const total = (context.dataset.data as number[]).reduce(
              (a, b) => a + b,
              0
            );
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `\${value.toFixed(2)} (${pct}%)`;
          },
        },
      },
    },
  };

  private generateLegendLabels(
    chart: { data: ChartConfiguration<'pie'>['data'] }
  ): { text: string; fillStyle: string; strokeStyle: string; lineWidth: number; hidden: boolean; index: number }[] {
    const data = chart.data;
    const dataset = data.datasets?.[0];
    if (!dataset?.data?.length) return [];
    const labels = data.labels ?? [];
    const bgColors = dataset.backgroundColor as string[] | undefined;
    return (dataset.data as number[]).map((value, i) => ({
      text: `${labels[i] ?? ''}  $${value.toFixed(2)}`,
      fillStyle: bgColors?.[i] ?? '#ccc',
      strokeStyle: '#fff',
      lineWidth: 2,
      hidden: false,
      index: i,
    }));
  }

  protected formatAmount(cents: number): string {
    const sign = cents < 0 ? '-' : '';
    return sign + '$' + Math.abs(cents / 100).toFixed(2);
  }
}
