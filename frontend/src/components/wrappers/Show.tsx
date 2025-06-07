import { ReactNode } from "react";

export default function Show({
  when,
  else: _else,
  children,
}: { when: boolean; else?: ReactNode; children: ReactNode }) {
  if (when) {
    return children;
  } else return _else;
}
