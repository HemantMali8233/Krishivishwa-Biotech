export const QUANTITY_UNITS = ['ml', 'L', 'kg', 'g', 'Pack'];

export function variantQuantitySortKey(v) {
  const n = Number(v.quantityValue) || 0;
  const u = String(v.quantityUnit || 'ml');
  if (u === 'L') return n * 1000;
  if (u === 'ml') return n;
  if (u === 'kg') return n * 1000000;
  if (u === 'g') return n * 1000;
  return n;
}

export function sortVariantsByQuantityDesc(variants) {
  if (!variants?.length) return [];
  return [...variants].sort((a, b) => variantQuantitySortKey(b) - variantQuantitySortKey(a));
}

export function formatVariantLabel(v) {
  if (!v || v.quantityValue == null || v.quantityValue === '') return '';
  return `${v.quantityValue} ${v.quantityUnit || ''}`.trim();
}

export function getProductVariants(product) {
  if (!product) return [];
  if (product.variants && product.variants.length > 0) {
    return sortVariantsByQuantityDesc(product.variants);
  }
  return [
    {
      quantityValue: 1,
      quantityUnit: 'Pack',
      price: product.price,
      stock: product.stock,
      image: product.image,
      originalPrice: product.originalPrice,
    },
  ];
}

export function getEffectiveProduct(product, variantIndex) {
  const variants = getProductVariants(product);
  const idx = Math.min(Math.max(0, variantIndex), variants.length - 1);
  const v = variants[idx];
  const hasStoredVariants = product.variants && product.variants.length > 0;
  let originalPrice;
  if (v.originalPrice != null && !Number.isNaN(Number(v.originalPrice))) {
    originalPrice = Number(v.originalPrice);
  } else if (!hasStoredVariants) {
    originalPrice = product.originalPrice;
  }
  return {
    ...product,
    price: v.price,
    stock: v.stock,
    image: v.image,
    originalPrice,
    variantIndex: idx,
    variantLabel: formatVariantLabel(v),
  };
}

export function cartLineKey(item) {
  const id = item._id || item.id;
  const label = item.variantLabel || 'default';
  return `${id}__${label}`;
}
