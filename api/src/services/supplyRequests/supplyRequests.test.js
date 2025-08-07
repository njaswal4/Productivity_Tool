import { 
  supplyRequests, 
  supplyRequest, 
  createSupplyRequest, 
  updateSupplyRequest, 
  deleteSupplyRequest,
  mySupplyRequests,
  pendingSupplyRequests,
  approveSupplyRequest,
  rejectSupplyRequest
} from './supplyRequests'

// Mock the auth context
const mockCurrentUser = { id: 'user-1', email: 'test@example.com' }

jest.mock('src/lib/auth', () => ({
  requireAuth: jest.fn(),
}))

jest.mock('@redwoodjs/graphql-server', () => ({
  context: { currentUser: mockCurrentUser },
  ValidationError: class ValidationError extends Error {},
  ForbiddenError: class ForbiddenError extends Error {},
}))

describe('supplyRequests', () => {
  scenario('returns all supplyRequests', async (scenario) => {
    const result = await supplyRequests()
    expect(result.length).toEqual(Object.keys(scenario.supplyRequest).length)
  })

  scenario('returns a single supplyRequest', async (scenario) => {
    const result = await supplyRequest({ id: scenario.supplyRequest.one.id })
    expect(result).toEqual(scenario.supplyRequest.one)
  })

  scenario('returns current user supply requests', async (scenario) => {
    const result = await mySupplyRequests()
    // Should return requests for the mocked current user
    expect(result).toBeDefined()
  })

  scenario('returns pending supply requests', async (scenario) => {
    const result = await pendingSupplyRequests()
    const pendingRequests = result.filter(request => request.status === 'PENDING')
    expect(pendingRequests.length).toBe(result.length)
  })

  scenario('creates a supplyRequest', async (scenario) => {
    const result = await createSupplyRequest({
      input: { 
        supplyId: scenario.officeSupply.one.id,
        quantityRequested: 5,
        justification: 'Need for project work',
        urgency: 'MEDIUM'
      },
    })

    expect(result.quantityRequested).toEqual(5)
    expect(result.status).toEqual('PENDING')
    expect(result.userId).toEqual(mockCurrentUser.id)
  })

  scenario('updates a supplyRequest', async (scenario) => {
    const original = await supplyRequest({ id: scenario.supplyRequest.pending.id })
    const result = await updateSupplyRequest({
      id: original.id,
      input: { quantityRequested: 10 },
    })

    expect(result.quantityRequested).toEqual(10)
  })

  scenario('deletes a supplyRequest', async (scenario) => {
    const original = await deleteSupplyRequest({ id: scenario.supplyRequest.pending.id })
    const result = await supplyRequest({ id: original.id })

    expect(result).toEqual(null)
  })

  scenario('approves a supply request', async (scenario) => {
    const result = await approveSupplyRequest({
      id: scenario.supplyRequest.pending.id,
      approverNotes: 'Approved for urgent project need'
    })

    expect(result.status).toEqual('APPROVED')
    expect(result.approverNotes).toEqual('Approved for urgent project need')
    expect(result.approvedAt).toBeDefined()
  })

  scenario('rejects a supply request', async (scenario) => {
    const result = await rejectSupplyRequest({
      id: scenario.supplyRequest.pending.id,
      approverNotes: 'Budget constraints'
    })

    expect(result.status).toEqual('REJECTED')
    expect(result.approverNotes).toEqual('Budget constraints')
    expect(result.approvedAt).toBeDefined()
  })
})
