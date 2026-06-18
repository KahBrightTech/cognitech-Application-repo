import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it('is a valid React component', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
