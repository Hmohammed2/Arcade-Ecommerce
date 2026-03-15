export function getUnitsPerKit(bundle: any, option: any) {
  const name = option.name.toLowerCase();

  if (name.includes("button")) {
    const item = bundle.items.find((i: any) =>
      i.product.name.toLowerCase().includes("obsf"),
    );
    return item?.quantity ?? 0;
  }

  if (name.includes("ball")) {
    const item = bundle.items.find((i: any) =>
      i.product.name.toLowerCase().includes("ball"),
    );
    return item?.quantity ?? 0;
  }

  return 0;
}
