import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

const BG = '#F8F7FA'

const globalCss = `
html, body {
  background-color: ${BG};
}
* {
  scrollbar-width: thin;
  scrollbar-color: ${BG} ${BG};
}
*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
*::-webkit-scrollbar-thumb {
  background: ${BG};
  border-radius: 4px;
}
*::-webkit-scrollbar-track {
  background: ${BG};
}
.trivai-hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.trivai-hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
`

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
