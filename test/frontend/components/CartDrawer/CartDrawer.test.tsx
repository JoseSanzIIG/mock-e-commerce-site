import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartDrawer } from '../../../../src/frontend/src/components/CartDrawer';
import type { CartSummary } from '../../../../src/frontend/src/types';

vi.mock('../../../../src/frontend/src/api');

import { fetchCart, updateCartItem, removeCartItem } from '../../../../src/frontend/src/api';

const mockedFetchCart = vi.mocked(fetchCart);
const mockedUpdateCartItem = vi.mocked(updateCartItem);
const mockedRemoveCartItem = vi.mocked(removeCartItem);

const mockCartSummary: CartSummary = {
  items: [
    {
      productId: 1,
      productName: 'Wireless Headphones',
      unitPrice: 79.99,
      quantity: 2,
      totalPrice: 159.98,
    },
  ],
  cartTotal: 159.98,
};

const emptyCartSummary: CartSummary = {
  items: [],
  cartTotal: 0,
};

describe('CartDrawer', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<CartDrawer isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders drawer when isOpen is true', async () => {
    mockedFetchCart.mockResolvedValue(emptyCartSummary);

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows empty state when cart has no items', async () => {
    mockedFetchCart.mockResolvedValue(emptyCartSummary);

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('renders cart items with correct details', async () => {
    mockedFetchCart.mockResolvedValue(mockCartSummary);

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows cart total', async () => {
    mockedFetchCart.mockResolvedValue(mockCartSummary);

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);

    await screen.findByText('Wireless Headphones');
    const totals = screen.getAllByText('$159.98');
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  it('plus button calls updateCartItem with incremented quantity', async () => {
    mockedFetchCart.mockResolvedValue(mockCartSummary);
    mockedUpdateCartItem.mockResolvedValue({
      productId: 1,
      productName: 'Wireless Headphones',
      unitPrice: 79.99,
      quantity: 3,
      totalPrice: 239.97,
    });

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);
    await screen.findByText('Wireless Headphones');

    await userEvent.click(
      screen.getByRole('button', { name: /increase quantity of wireless headphones/i })
    );

    expect(mockedUpdateCartItem).toHaveBeenCalledWith(1, 3);
  });

  it('minus button on quantity 1 calls removeCartItem', async () => {
    const singleItemCart: CartSummary = {
      items: [
        {
          productId: 1,
          productName: 'Wireless Headphones',
          unitPrice: 79.99,
          quantity: 1,
          totalPrice: 79.99,
        },
      ],
      cartTotal: 79.99,
    };
    mockedFetchCart.mockResolvedValue(singleItemCart);
    mockedRemoveCartItem.mockResolvedValue(undefined);

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);
    await screen.findByText('Wireless Headphones');

    await userEvent.click(
      screen.getByRole('button', { name: /decrease quantity of wireless headphones/i })
    );

    expect(mockedRemoveCartItem).toHaveBeenCalledWith(1);
  });

  it('minus button on quantity above 1 calls updateCartItem with decremented quantity', async () => {
    mockedFetchCart.mockResolvedValue(mockCartSummary);
    mockedUpdateCartItem.mockResolvedValue({
      productId: 1,
      productName: 'Wireless Headphones',
      unitPrice: 79.99,
      quantity: 1,
      totalPrice: 79.99,
    });

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);
    await screen.findByText('Wireless Headphones');

    await userEvent.click(
      screen.getByRole('button', { name: /decrease quantity of wireless headphones/i })
    );

    expect(mockedUpdateCartItem).toHaveBeenCalledWith(1, 1);
  });

  it('plus button is disabled when quantity is 5', async () => {
    const maxQtyCart: CartSummary = {
      items: [
        {
          productId: 1,
          productName: 'Wireless Headphones',
          unitPrice: 79.99,
          quantity: 5,
          totalPrice: 399.95,
        },
      ],
      cartTotal: 399.95,
    };
    mockedFetchCart.mockResolvedValue(maxQtyCart);

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);
    await screen.findByText('Wireless Headphones');

    expect(
      screen.getByRole('button', { name: /increase quantity of wireless headphones/i })
    ).toBeDisabled();
  });

  it('remove button calls removeCartItem', async () => {
    mockedFetchCart.mockResolvedValue(mockCartSummary);
    mockedRemoveCartItem.mockResolvedValue(undefined);

    render(<CartDrawer isOpen={true} onClose={vi.fn()} />);
    await screen.findByText('Wireless Headphones');

    await userEvent.click(
      screen.getByRole('button', { name: /remove wireless headphones from cart/i })
    );

    expect(mockedRemoveCartItem).toHaveBeenCalledWith(1);
  });

  it('close button calls onClose', async () => {
    mockedFetchCart.mockResolvedValue(emptyCartSummary);
    const onClose = vi.fn();

    render(<CartDrawer isOpen={true} onClose={onClose} />);
    await screen.findByText(/your cart is empty/i);

    await userEvent.click(screen.getByRole('button', { name: /close cart/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('clicking backdrop calls onClose', async () => {
    mockedFetchCart.mockResolvedValue(emptyCartSummary);
    const onClose = vi.fn();

    render(<CartDrawer isOpen={true} onClose={onClose} />);
    await screen.findByText(/your cart is empty/i);

    await userEvent.click(screen.getByTestId('cart-backdrop'));

    expect(onClose).toHaveBeenCalled();
  });
});
