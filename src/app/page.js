import { getProduct } from "@/lib/redis";

export default async function Home() {

  const product = await getProduct("home-decor", 69)
  console.log('heres my product', product)
  return (
    <>
      Home
    </>
  );
}
