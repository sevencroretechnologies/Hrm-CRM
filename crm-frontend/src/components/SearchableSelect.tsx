import React, { useState, useRef, useEffect } from "react";

interface SearchableSelectOption {
    id: number;
    label: string;
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    isInvalid?: boolean;
    errorMessage?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Type to search...",
    disabled = false,
    isInvalid = false,
    errorMessage,
}: SearchableSelectProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Get the currently selected option's label
    const selectedOption = options.find((o) => o.id.toString() === value);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sync display text with selected value
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm(selectedOption?.label || "");
        }
    }, [value, selectedOption, isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset search text to selected value's label
                setSearchTerm(selectedOption?.label || "");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedOption]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll("li");
            if (items[highlightedIndex]) {
                items[highlightedIndex].scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
        setHighlightedIndex(-1);

        // If input is cleared, clear the selection
        if (e.target.value === "") {
            onChange("");
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        setSearchTerm("");
        setHighlightedIndex(-1);
    };

    const handleSelect = (option: SearchableSelectOption) => {
        onChange(option.id.toString());
        setSearchTerm(option.label);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter") {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setSearchTerm(selectedOption?.label || "");
                inputRef.current?.blur();
                break;
        }
    };

    const handleClear = () => {
        onChange("");
        setSearchTerm("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={wrapperRef} className="position-relative">
            <div className="input-group">
                <input
                    ref={inputRef}
                    type="text"
                    className={`form-control ${isInvalid ? "is-invalid" : ""}`}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                />
                {value && !disabled && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleClear}
                        tabIndex={-1}
                        title="Clear selection"
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && !disabled && (
                <ul
                    ref={listRef}
                    className="list-group position-absolute w-100 shadow-sm"
                    style={{
                        zIndex: 1050,
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #dee2e6",
                        borderTop: "none",
                        borderRadius: "0 0 0.375rem 0.375rem",
                    }}
                >
                    {filteredOptions.length === 0 ? (
                        <li className="list-group-item text-muted text-center py-2" style={{ fontSize: "0.875rem" }}>
                            No results found
                        </li>
                    ) : (
                        filteredOptions.map((option, index) => (
                            <li
                                key={option.id}
                                className={`list-group-item list-group-item-action py-2 ${
                                    index === highlightedIndex ? "active" : ""
                                } ${option.id.toString() === value ? "fw-bold" : ""}`}
                                style={{ cursor: "pointer", fontSize: "0.875rem" }}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur
                                    handleSelect(option);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                {option.label}
                            </li>
                        ))
                    )}
                </ul>
            )}

            {isInvalid && errorMessage && (
                <div className="invalid-feedback d-block">{errorMessage}</div>
            )}
        </div>
    );
}
