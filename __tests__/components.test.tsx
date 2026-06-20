import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BarChart } from '@/components/BarChart';
import { RadioGroup } from '@/components/forms';
import { ProgressTracker } from '@/components/ProgressTracker';

describe('BarChart', () => {
  it('exposes the data in an accessible table', () => {
    render(
      <BarChart
        breakdown={{ transport: 200, home: 80, food: 150, lifestyle: 90 }}
        total={520}
      />,
    );
    // Screen-reader table with a caption and the category values.
    expect(screen.getByText(/Carbon footprint by category/i)).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Transport 200/i })).toBeInTheDocument();
  });
});

describe('RadioGroup', () => {
  it('calls onChange with the selected value', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        legend="Diet"
        value="vegan"
        onChange={onChange}
        options={[
          { value: 'vegan', label: 'Vegan' },
          { value: 'heavy_meat', label: 'Heavy meat' },
        ]}
      />,
    );
    fireEvent.click(screen.getByLabelText('Heavy meat'));
    expect(onChange).toHaveBeenCalledWith('heavy_meat');
  });
});

describe('ProgressTracker', () => {
  const history = [
    { month: '2026-05', total: 500 },
    { month: '2026-06', total: 450 },
  ];

  it('shows the streak and month-over-month change', () => {
    render(
      <ProgressTracker
        currentTotal={450}
        history={history}
        goal={null}
        savedThisMonth={false}
        onSaveMonth={() => {}}
        onSetGoal={() => {}}
      />,
    );
    expect(screen.getByText(/2 months/i)).toBeInTheDocument();
    expect(screen.getByText(/-50 kg/i)).toBeInTheDocument();
  });

  it('logs the current month when the button is clicked', () => {
    const onSaveMonth = vi.fn();
    render(
      <ProgressTracker
        currentTotal={450}
        history={[]}
        goal={null}
        savedThisMonth={false}
        onSaveMonth={onSaveMonth}
        onSetGoal={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /log this month/i }));
    expect(onSaveMonth).toHaveBeenCalled();
  });

  it('disables logging when already saved this month', () => {
    render(
      <ProgressTracker
        currentTotal={450}
        history={history}
        goal={167}
        savedThisMonth
        onSaveMonth={() => {}}
        onSetGoal={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /saved this month/i })).toBeDisabled();
  });
});
