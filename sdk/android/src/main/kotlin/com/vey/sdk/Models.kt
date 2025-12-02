package com.vey.sdk

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Address(
    @Json(name = "street") val street: String? = null,
    @Json(name = "city") val city: String? = null,
    @Json(name = "province") val province: String? = null,
    @Json(name = "postalCode") val postalCode: String? = null,
    @Json(name = "country") val country: String? = null
)

@JsonClass(generateAdapter = true)
data class ValidationResult(
    @Json(name = "valid") val valid: Boolean,
    @Json(name = "errors") val errors: List<String> = emptyList()
)

data class VeyConfig(
    val apiKey: String,
    val apiEndpoint: String = "https://api.vey.example"
)
