<?php

class Validator
{
    private array $errors = [];
    private array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function required(string $field, string $label = null): self
    {
        $label = $label ?? $field;
        if (!isset($this->data[$field]) || trim((string) $this->data[$field]) === '') {
            $this->errors[$field][] = "$label is required.";
        }
        return $this;
    }

    public function email(string $field): self
    {
        if (!empty($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field][] = 'Must be a valid email address.';
        }
        return $this;
    }

    public function minLength(string $field, int $length): self
    {
        if (!empty($this->data[$field]) && strlen((string) $this->data[$field]) < $length) {
            $this->errors[$field][] = "Must be at least $length characters.";
        }
        return $this;
    }

    public function maxLength(string $field, int $length): self
    {
        if (!empty($this->data[$field]) && strlen((string) $this->data[$field]) > $length) {
            $this->errors[$field][] = "Must be at most $length characters.";
        }
        return $this;
    }

    public function matches(string $field, string $otherField, string $label = null): self
    {
        $label = $label ?? $otherField;
        if (($this->data[$field] ?? null) !== ($this->data[$otherField] ?? null)) {
            $this->errors[$field][] = "Must match $label.";
        }
        return $this;
    }

    public function passes(): bool
    {
        return empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    /** Validates and halts the request with a 422 JSON response if invalid. */
    public function validate(): void
    {
        if (!$this->passes()) {
            Response::error('Validation failed.', 422, $this->errors());
        }
    }
}
