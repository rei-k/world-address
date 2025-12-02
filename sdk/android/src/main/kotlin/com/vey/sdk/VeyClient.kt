package com.vey.sdk

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

class VeyClient(private val config: VeyConfig) {
    private val client = OkHttpClient()
    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    /**
     * Validate an address for a specific country
     */
    suspend fun validateAddress(address: Address, countryCode: String): Result<ValidationResult> {
        return try {
            val json = moshi.adapter(Map::class.java).toJson(
                mapOf(
                    "address" to address,
                    "countryCode" to countryCode
                )
            )

            val request = Request.Builder()
                .url("${config.apiEndpoint}/validate")
                .post(json.toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer ${config.apiKey}")
                .build()

            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw IOException("Empty response body")
                val result = moshi.adapter(ValidationResult::class.java).fromJson(body)
                    ?: throw IOException("Failed to parse response")
                Result.success(result)
            } else {
                Result.failure(IOException("Request failed: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Normalize an address to standard format
     */
    suspend fun normalizeAddress(address: Address, countryCode: String): Result<Address> {
        return try {
            val json = moshi.adapter(Map::class.java).toJson(
                mapOf(
                    "address" to address,
                    "countryCode" to countryCode
                )
            )

            val request = Request.Builder()
                .url("${config.apiEndpoint}/normalize")
                .post(json.toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer ${config.apiKey}")
                .build()

            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw IOException("Empty response body")
                val result = moshi.adapter(Address::class.java).fromJson(body)
                    ?: throw IOException("Failed to parse response")
                Result.success(result)
            } else {
                Result.failure(IOException("Request failed: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Encode address components into a PID
     */
    fun encodePID(components: Map<String, String>): String {
        val parts = mutableListOf<String>()
        
        components["country"]?.let { parts.add(it) }
        components["admin1"]?.let { parts.add(it) }
        components["admin2"]?.let { parts.add(it) }
        components["locality"]?.let { parts.add(it) }
        
        return parts.joinToString("-")
    }
}
