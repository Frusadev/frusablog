import { Button } from "../button";
import { Input } from "../input";

export default function PostSearch() {
  return (
    <div className="w-2/3 max-w-[500px] flex gap-2">
      <Input placeholder="Search posts..." className="rounded-xl" />
      <Button className="rounded-xl cursor-pointer">Search</Button>
    </div>
  );
}
