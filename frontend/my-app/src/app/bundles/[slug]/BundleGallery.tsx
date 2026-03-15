import Image from "next/image";
import { getImageUrl } from "@/library/getImageUrl";

export default function BundleGallery({ bundle }: any) {
  return (
    <div className="md:col-span-5">
      <div className="relative w-full aspect-square border rounded-lg bg-gray-50 dark:bg-gray-800">
        <Image
          src={getImageUrl(bundle.image)}
          alt={bundle.name}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
