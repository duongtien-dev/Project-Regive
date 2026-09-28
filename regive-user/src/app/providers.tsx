"use client";

import { App, ConfigProvider, theme } from "antd";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 6,
          fontFamily: "var(--font-geist-sans)",
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
