import React from 'react';
import { InputNumber } from 'antd';
import { formatVND } from '@/lib/format';

interface MoneyInputProps {
  value?: number;
  onChange?: (val: number | null) => void;
  presets?: number[];
  min?: number;
  max?: number;
  className?: string;
}

const DEFAULT_PRESETS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  min = 10000,
  max = 500000000,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quick Select Preset Chips */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {presets.map((preset) => {
          const isSelected = value === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange?.(preset)}
              className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                isSelected
                  ? 'border-p-s600 bg-p-s50 text-p-s700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-p-s300 hover:bg-gray-50'
              }`}
            >
              {formatVND(preset)}
            </button>
          );
        })}
      </div>

      {/* Custom Input */}
      <div className="relative">
        <InputNumber
          value={value}
          onChange={(val) => onChange?.(val)}
          min={min}
          max={max}
          step={50000}
          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(val) => {
            const parsed = val?.replace(/\$\s?|(,*)/g, '');
            return parsed ? parseInt(parsed, 10) : 0;
          }}
          addonAfter="VND"
          size="large"
          className="w-full !rounded-xl"
          placeholder="Hoặc nhập số tiền tùy chọn..."
        />
      </div>
      <p className="text-xs text-gray-500">
        Số tiền tối thiểu: {formatVND(min)}
      </p>
    </div>
  );
};
