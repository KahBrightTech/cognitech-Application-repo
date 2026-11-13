const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, options)
  if (!response.ok) {
    throw new Error(`NOVA API ${path} failed with ${response.status}`)
  }
  return response.json()
}

export const getBriefing = () => request('/briefing')

export const sendMessage = (message) =>
  request('/chat', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ message }),
  })
