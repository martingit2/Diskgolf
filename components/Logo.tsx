import Image from "next/image";
import Link from "next/link";

function Logo() {
  return (
    <div className="flex lg:flex-1 gap-x-8">
      <span className="font-sans text-3xl font-bold bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text">
        DiscGolf
      </span>
      <Link href="/" className="-m-1.5 p-1.5">
        <Image src="/lightgreen.png" alt="Logo" width={48} height={48} />
      </Link>
    </div>
  );
}

export default Logo;
