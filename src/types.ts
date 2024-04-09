export type PhcNode = {
  id: string
  hash: Uint8Array
  salt: Uint8Array
  version?: number
  parameters?: Record<string, number>
}
