import Posts from "./components/Posts"

export const revalidate = 86400

export default function Home() {
  return (
    <div className="mx-auto">
      {/* @ts-expect-error Server Component */}
      <Posts />
    </div>
  )
}
