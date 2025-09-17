# Error Handling Strategy

## Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

## Error Handling Implementation

```typescript
// Frontend Error Handler
export function useErrorHandler() {
  const handleError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      switch (error.data?.code) {
        case 'UNAUTHORIZED':
          router.push('/login');
          break;
        case 'FORBIDDEN':
          if (error.message.includes('sync')) {
            showSyncRequiredDialog();
          }
          break;
        default:
          toast.error(error.message);
      }
    }
  };

  return { handleError };
}
```

---
