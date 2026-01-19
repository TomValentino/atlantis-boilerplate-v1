import { fetchCollection } from "@/store/collection/collection-server"
import ClientPage from "./client-page";
import { SetupCollectionPageState } from "@/store/collection/collection-state";

export default async function Page({ params, searchParams }) {
    const { collectionHandle } = await params;
    const { color, size, price_min, price_max, tag } = await searchParams


    const filters = buildFiltersFromSearchParams(color, size, price_min, price_max, tag);
    const { sortKey, reverse } = parseSortOptions(searchParams);

    const collection = await fetchCollection({
        handle: collectionHandle,
        first: 24,
        filters,
        sortKey,
        reverse
    });

    // ----- CASE 1: NO COLLECTION FOUND -----
    if (!collection || !collection.id) {
        return <EmptyState message="Collection not found." />;
    }

    const products = collection.products ?? [];

    // ----- CASE 2: COLLECTION EXISTS BUT HAS 0 PRODUCTS -----
    if (products.length === 0 && filters.length === 0) {
        return <EmptyState message="This collection is currently empty." />;
    }

    // ----- CASE 3: FILTERS RETURNED 0 PRODUCTS -----
    if (products.length === 0 && filters.length > 0) {
        return (
        <EmptyState
            message="No products match your filters."
            showResetFilters
        />
        );
    }

    // ----- CASE 4 + 5: PRODUCTS EXIST -----
    const hasMore = collection.pageInfo?.hasNextPage === true;
    const nextCursor = collection.pageInfo?.endCursor;
    console.log('products', products)
    console.log('hasMore', hasMore)
    console.log('nextCursor', nextCursor)

  return <>
    <SetupCollectionPageState collection={collection} initialProducts={products} >
        <ClientPage collection={collection}  initialProducts={products} />
    </SetupCollectionPageState>
  </>;
}


function EmptyState({ message, showResetFilters }) {
  return (
    <div className="py-20 text-center text-gray-400">
      <p>{message}</p>
      {showResetFilters && (
        <a href="?" className="mt-4 inline-block text-sm underline">
          Reset filters
        </a>
      )}
    </div>
  );
}



export function buildFiltersFromSearchParams(color, size, price_min, price_max, tag ) {
  const filters = [];

  // COLOR (metafield)
  if (color) {
    filters.push({
      productMetafield: {
        namespace: "custom",
        key: "color",
        value: color
      }
    });
  }

  // SIZE (variant option)
  if (size) {
    filters.push({
      variantOption: {
        name: "Size",
        value: size
      }
    });
  }

  // PRICE RANGE
  const min = price_min;
  const max = price_max;

  if (min || max) {
    filters.push({
      price: {
        min: min ? Number(min) : 0,
        max: max ? Number(max) : 99999999
      }
    });
  }

  // TAG
  if (tag) {
    filters.push({ tag: tag });
  }

    return filters;

}


function parseSortOptions(searchParams) {
  const sort = searchParams.sort || "MANUAL";
  const order = searchParams.order || "asc";

  return {
    sortKey: sort,
    reverse: order === "desc"
  };
}

