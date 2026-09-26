<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeliveryOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'min:2', 'max:100'],
            'delivery_address' => ['required', 'string', 'min:5', 'max:255'],
            'city_region' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:10'],
            // Strict Philippine Mobile Number: Exactly 11 digits starting with 09
            'contact_number' => [
                'required',
                'string',
                'regex:/^09\d{9}$/',
            ],
            'driver_notes' => ['nullable', 'string', 'max:300'],
            'payment_method' => ['required', Rule::in(['cash', 'online'])],
            
            // GCash Proof of Payment: Mandatory if payment_method is online, image <= 5MB
            'gcash_receipt' => [
                'required_if:payment_method,online',
                'nullable',
                'file',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:5120', // 5MB limit in kilobytes
            ],

            // Cart Items Array
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'items.*.customizations' => ['nullable', 'array'],
        ];
    }

    /**
     * Custom error messages for client feedback.
     */
    public function messages(): array
    {
        return [
            'contact_number.required' => 'Customer contact number is required for delivery coordination.',
            'contact_number.regex' => 'Please enter a valid 11-digit Philippine mobile number starting with 09 (e.g. 09171234567).',
            'gcash_receipt.required_if' => 'Proof of Payment image upload is mandatory for GCash transactions.',
            'gcash_receipt.image' => 'The proof of payment must be a valid image file.',
            'gcash_receipt.mimes' => 'The proof of payment must be in PNG, JPG, JPEG, or WEBP format.',
            'gcash_receipt.max' => 'The proof of payment image cannot exceed 5MB.',
        ];
    }
}