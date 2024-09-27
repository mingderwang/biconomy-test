import { http, type Hex, createPublicClient, parseEther } from 'viem'
import {
  createBundlerClient,
  createPaymasterClient,
  toCoinbaseSmartAccount,
} from 'viem/account-abstraction'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
})

const owner = privateKeyToAccount(import.meta.env.VITE_PRIVATE_KEY as Hex)

const account = await toCoinbaseSmartAccount({
  client,
  owners: [owner],
})

const paymasterClient = createPaymasterClient({
  transport: http(
    import.meta.env.VITE_PAYMASTER_RPC_URL 
  ),
})

const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http(
    import.meta.env.VITE_BUNDLER_RPC_URL 
  ),
  paymaster: paymasterClient,
  paymasterContext: {
    mode: 'SPONSORED',
    calculateGasLimits: true,
    expiryDuration: 300,
    sponsorshipInfo: {
      webhookData: {},
      smartAccountInfo: {
        name: 'BICONOMY',
        version: '2.0.0',
      },
    },
  },
})

const hash = await bundlerClient.sendUserOperation({
  calls: [
    // send 0.000001 ETH to self
    {
      to: account.address,
      value: parseEther('0.000001'),
    },
  ],
})

export default [`User Operation Hash: ${hash}`]
