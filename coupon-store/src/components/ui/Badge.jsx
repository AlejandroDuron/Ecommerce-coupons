// components/ui/Badge.jsx

const variantClass = {
  active:   'badge-active',
  used:     'badge-used',
  expired:  'badge-expired',
  discount: 'badge-discount',
}

export default function Badge({ variant = 'active', children }) {
  return (
    <span className={`badge ${variantClass[variant] || ''}`}>
      {children}
    </span>
  )
}
