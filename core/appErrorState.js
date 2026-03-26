// Translates internal playback and solver failures into user-facing status messages.
// Expected playback and solver failures are downgraded to status text so the UI stays calm.
export function getActionErrorState(
  error,
  {
    fallbackMessage = 'Action failed',
    invalidFaceletsMessage = 'The current cube state could not be serialized.',
    impossibleStateMessage = 'The current cube state is impossible to solve.'
  } = {}
) {
  if (error?.code === 'PLAYBACK_CANCELLED') {
    return {
      shouldLog: false,
      status: 'Playback stopped'
    };
  }

  if (error?.code === 'INVALID_FACELETS') {
    return {
      shouldLog: false,
      status: invalidFaceletsMessage
    };
  }

  if (error?.code === 'IMPOSSIBLE_STATE') {
    return {
      shouldLog: false,
      status: impossibleStateMessage
    };
  }

  return {
    shouldLog: true,
    status: error?.message ?? fallbackMessage
  };
}
