// class ApiError extends Error {
//   data?: any
//   constructor(message: string) {
//     super(message)
//     this.name = 'ApiError'
//   }
// }

// type FetcherOptions = {
//   method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
//   headers?: Record<string, string>
//   body?: BodyInit | object
//   credentials?: 'include' | 'omit' | 'same-origin'
// }

export const fetcher = async <T = any>(
  url: string,
  params?: Record<string, any> | [string, Record<string, any>]
): Promise<T> => {
  // Обрабатываем случай, когда params - это массив (как в SWR)
  const [finalUrl, finalParams] = Array.isArray(params) 
    ? [params[0], params[1]]
    : [url, params]

  const urlWithParams = finalParams
    ? `${finalUrl}?${new URLSearchParams(finalParams)}`
    : finalUrl

  const res = await fetch(urlWithParams)

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    throw error
  }

  return res.json()
}