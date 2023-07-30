import { HTMLInputTypeAttribute, useRef } from "react";

import styles from "@/styles/ui/Input.module.css";

export default function Input({
  className = "",
  onChange,
  value,
  placeholder = "",
  type = "text",
  name = "",
  id = "",
  label,
  isError = false,
  errorText = "Error",
  checked = false,
  left,
  right,
  readonly = false,
  isLoading = false,
  required = false,
}: {
  className?: string;
  onChange: Function;
  value?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute | undefined;
  name?: string;
  id?: string;
  label?: string;
  isError?: boolean;
  errorText?: string;
  checked?: boolean;
  left?: any;
  right?: any;
  readonly?: boolean;
  isLoading?: boolean;
  required?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  switch (type) {
    case "checkbox":
      return (
        <div className="flex flex-col gap-1">
          <div
            className={`relative flex cursor-pointer
                            flex-row items-center justify-between rounded-lg
                            border p-3 px-3 outline-none transition-all duration-200
                            ${isError ? styles.inputError : styles.input}
                        `}
            onClick={() =>
              onChange(!checked) as (
                e: React.ChangeEvent<HTMLInputElement>,
              ) => void
            }
          >
            {label && (
              <label htmlFor={name} className="select-none">
                {label}
              </label>
            )}
            <input
              placeholder={placeholder}
              className={`${isError ? styles.inputError : styles.input} `}
              type="checkbox"
              id={id}
              name={name}
              checked={checked}
              onChange={() => null}
              readOnly={readonly}
              required={required}
            />
          </div>
          {
            <span className="text-xs font-bold text-red-500">
              {isError && errorText}
            </span>
          }
        </div>
      );
    case "image":
    case "file":
      return (
        <>
          <div className="flex flex-col gap-1">
            <div
              className={`relative flex cursor-pointer
                            flex-row items-center justify-between rounded-lg
                            border p-3 px-3 outline-none transition-all duration-200
                            ${isError ? styles.inputError : styles.input}
                        `}
            >
              {label && (
                <label htmlFor={name} className="select-none">
                  {label}
                </label>
              )}
              <input
                placeholder={placeholder}
                className={` hidden `}
                type="file"
                id={id}
                name={name}
                onChange={(e) =>
                  onChange(e.target.files) as (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => void
                }
                readOnly={readonly}
                accept="image/png, image/jpeg"
                ref={fileInputRef}
                required={required}
              />

              <button
                className={`${
                  isError ? styles.inputError : styles.input
                } relative flex flex-row items-center gap-2`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {left && (
                  <div className="flex select-none items-center justify-center pl-3">
                    {left}
                  </div>
                )}
                <span>Upload</span>
                {right && (
                  <div className="flex select-none items-center justify-center pr-3">
                    {right}
                  </div>
                )}
              </button>
            </div>
            {
              <span className="text-xs font-bold text-red-500">
                {isError && errorText}
              </span>
            }
          </div>
        </>
      );
    default:
      return (
        <>
          <div className={`${styles.inputWrapper}`}>
            <label htmlFor={name} className="select-none">
              {label}
            </label>
            <div
              className={`${
                isError ? styles.inputError : styles.input
              } flex flex-row items-center max-xs:flex-wrap`}
            >
              {left && <div className="select-none pl-3">{left}</div>}
              <input
                placeholder={placeholder}
                className={` h-full w-full border-0 bg-transparent outline-none ${
                  left && "pl-10"
                } `}
                type={type}
                id={id}
                name={name}
                onChange={
                  onChange as (e: React.ChangeEvent<HTMLInputElement>) => void
                }
                value={value}
                readOnly={readonly}
                required={required}
              />
              {right && <div className="select-none pr-3">{right}</div>}
            </div>
            {
              <span className="text-xs font-bold text-red-500">
                {isError && errorText}
              </span>
            }
          </div>
        </>
      );
  }
}
