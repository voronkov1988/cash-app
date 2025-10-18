'use client'
import { SWRConfig } from 'swr'
import type { SWRConfiguration } from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())



const swrConfig: SWRConfiguration = {
  fetcher,
  refreshInterval: 0,
  revalidateOnFocus: true,
}

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  )
}