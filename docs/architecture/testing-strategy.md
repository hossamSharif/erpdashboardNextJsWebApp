# Testing Strategy

## Testing Pyramid

```
        E2E Tests (10%)
       /              \
    Integration Tests (30%)
   /                      \
Frontend Unit (30%)  Backend Unit (30%)
```

## Test Organization

### Frontend Tests

```
apps/web/tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── api/
│   └── pages/
└── e2e/
    ├── auth.spec.ts
    ├── transactions.spec.ts
    └── sync.spec.ts
```

### Test Examples

```typescript
// Frontend Component Test
describe('TransactionForm', () => {
  it('should submit transaction in Arabic mode', async () => {
    render(<TransactionForm shopId="shop-1" />);

    fireEvent.change(screen.getByLabelText('المبلغ'), {
      target: { value: '100' }
    });

    fireEvent.click(screen.getByText('حفظ'));

    expect(mockCreate).toHaveBeenCalledWith({
      amount: 100,
      shopId: 'shop-1',
    });
  });
});

// E2E Test
test('should handle offline-to-online sync', async ({ page, context }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  // Go offline
  await context.setOffline(true);

  // Create transaction offline
  await page.click('button:has-text("إضافة معاملة")');
  await page.fill('[name="amount"]', '150');
  await page.click('button:has-text("حفظ")');

  // Verify saved locally
  await expect(page.locator('.pending-sync-badge')).toHaveText('1');

  // Go online and sync
  await context.setOffline(false);
  await page.waitForSelector('.sync-success-toast');

  // Verify synced
  await expect(page.locator('.pending-sync-badge')).toHaveText('0');
});
```

---
