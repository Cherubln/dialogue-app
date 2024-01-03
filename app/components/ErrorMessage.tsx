import { PropsWithChildren } from "react";

const ErrorMessage = ({ children }: PropsWithChildren) => {
  if (!children) return null;

  return (
    <label className="label">
      <span className="label-text-alt text-secondary">{children}</span>
    </label>
  );
};

export default ErrorMessage;
