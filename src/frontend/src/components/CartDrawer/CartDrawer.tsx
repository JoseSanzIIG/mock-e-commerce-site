import { useState, useEffect, useCallback } from 'react';
import type { CartSummary, CartItem } from '../../types';
import { fetchCart, updateCartItem, removeCartItem } from '../../api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCartChange?: (totalItems: number) => void;
}

export function CartDrawer({ isOpen, onClose, onCartChange }: CartDrawerProps) {
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await fetchCart();
      setCartSummary(summary);
      const totalItems = summary.items.reduce((sum, item) => sum + item.quantity, 0);
      onCartChange?.(totalItems);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [onCartChange]);

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen, loadCart]);

  const handleIncrement = async (item: CartItem) => {
    try {
      await updateCartItem(item.productId, item.quantity + 1);
      await loadCart();
    } catch {
      // silently fail
    }
  };

  const handleDecrement = async (item: CartItem) => {
    try {
      if (item.quantity === 1) {
        await removeCartItem(item.productId);
      } else {
        await updateCartItem(item.productId, item.quantity - 1);
      }
      await loadCart();
    } catch {
      // silently fail
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeCartItem(productId);
      await loadCart();
    } catch {
      // silently fail
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="cart-drawer__backdrop"
        data-testid="cart-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="cart-drawer"
      >
        <div className="cart-drawer__header">
          <h2>Your cart</h2>
          <button
            className="cart-drawer__close"
            aria-label="Close cart"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {loading && <p>Loading…</p>}

        {!loading && cartSummary && (
          <>
            {cartSummary.items.length === 0 ? (
              <p className="cart-drawer__empty">Your cart is empty.</p>
            ) : (
              <>
                <ul className="cart-drawer__items" aria-label="Cart items">
                  {cartSummary.items.map((item) => (
                    <li key={item.productId} className="cart-drawer__item">
                      <div className="cart-drawer__item-info">
                        <span className="cart-drawer__item-name">{item.productName}</span>
                        <span className="cart-drawer__item-price">${item.unitPrice.toFixed(2)}</span>
                      </div>
                      <div className="cart-drawer__item-controls">
                        <button
                          aria-label={`Decrease quantity of ${item.productName}`}
                          onClick={() => handleDecrement(item)}
                        >
                          −
                        </button>
                        <span aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                        <button
                          aria-label={`Increase quantity of ${item.productName}`}
                          onClick={() => handleIncrement(item)}
                          disabled={item.quantity >= 5}
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-drawer__item-total">${item.totalPrice.toFixed(2)}</span>
                      <button
                        aria-label={`Remove ${item.productName} from cart`}
                        onClick={() => handleRemove(item.productId)}
                        className="cart-drawer__item-remove"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="cart-drawer__total">
                  <span>Total:</span>
                  <span>${cartSummary.cartTotal.toFixed(2)}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
