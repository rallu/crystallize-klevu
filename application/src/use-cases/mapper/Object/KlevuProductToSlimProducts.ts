import { KlevuRecord } from "@klevu/core";
import { ProductSlim } from "~/use-cases/contracts/Product";

export default (product: KlevuRecord): ProductSlim => {
  const sale: any = {}
  if (product.salePrice !== product.price) {
    sale.sales = {
      currency: { code: product.currency as any, symbol: '€'},
      value: parseFloat(product.salePrice),
      identifier: "sales",
      name: "Sales"
    }
  }

  const path = "/"  + product.url.split("/").slice(4).join("/")

  return {
    id: product.itemGroupId,
    name: product.name,
    path,
    topics: [],
    variant: {
      id: product.id,
      images: [{
        altText: product.name,
        key: product.id,
        url: product.imageUrl,
        variants: []
      }],
      isDefault: product.id === product.itemGroupId,
      name: product.name,
      sku: product.sku,
      description: product.shortDesc,
      attributes: {},
      priceVariants: {
        default: {
          currency: { code: product.currency as any, symbol: '€'},
          value: parseFloat(product.price),
          identifier: "default",
          name: "Retail"
        },
        ...sale
      },
      stockLocations: {}
    }
  }
}