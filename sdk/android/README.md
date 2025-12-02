# VeySDK (Android)

Kotlin SDK for World Address YAML - Address validation and formatting for Android applications.

## Installation

### Gradle

Add to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.vey:sdk:1.0.0'
}
```

Or using Gradle Kotlin DSL:

```kotlin
dependencies {
    implementation("com.vey:sdk:1.0.0")
}
```

## Usage

### Initialize the Client

```kotlin
import com.vey.sdk.VeyClient
import com.vey.sdk.VeyConfig

val veyClient = VeyClient(
    VeyConfig(apiKey = "your-api-key")
)
```

### Validate an Address

```kotlin
import com.vey.sdk.Address
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

val address = Address(
    street = "1-1 Chiyoda",
    city = "Tokyo",
    postalCode = "100-0001"
)

CoroutineScope(Dispatchers.IO).launch {
    val result = veyClient.validateAddress(address, "JP")
    
    result.onSuccess { validation ->
        if (validation.valid) {
            println("Address is valid!")
        } else {
            println("Errors: ${validation.errors}")
        }
    }.onFailure { error ->
        println("Error: ${error.message}")
    }
}
```

### Normalize an Address

```kotlin
CoroutineScope(Dispatchers.IO).launch {
    val result = veyClient.normalizeAddress(address, "JP")
    
    result.onSuccess { normalized ->
        println("Normalized: ${normalized.street}")
    }.onFailure { error ->
        println("Error: ${error.message}")
    }
}
```

### Encode PID

```kotlin
val pid = veyClient.encodePID(
    mapOf(
        "country" to "JP",
        "admin1" to "13",
        "admin2" to "113"
    )
)
println(pid) // "JP-13-113"
```

## Jetpack Compose Integration

```kotlin
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vey.sdk.*
import kotlinx.coroutines.launch

@Composable
fun AddressFormScreen(veyClient: VeyClient) {
    var street by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var postalCode by remember { mutableStateOf("") }
    var isValidating by remember { mutableStateOf(false) }
    var errors by remember { mutableStateOf(listOf<String>()) }
    
    val scope = rememberCoroutineScope()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        OutlinedTextField(
            value = street,
            onValueChange = { street = it },
            label = { Text("Street Address") },
            modifier = Modifier.fillMaxWidth()
        )
        
        OutlinedTextField(
            value = city,
            onValueChange = { city = it },
            label = { Text("City") },
            modifier = Modifier.fillMaxWidth()
        )
        
        OutlinedTextField(
            value = postalCode,
            onValueChange = { postalCode = it },
            label = { Text("Postal Code") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Button(
            onClick = {
                scope.launch {
                    isValidating = true
                    errors = emptyList()
                    
                    val address = Address(
                        street = street,
                        city = city,
                        postalCode = postalCode
                    )
                    
                    val result = veyClient.validateAddress(address, "JP")
                    
                    result.onSuccess { validation ->
                        if (!validation.valid) {
                            errors = validation.errors
                        }
                    }.onFailure { error ->
                        errors = listOf(error.message ?: "Unknown error")
                    }
                    
                    isValidating = false
                }
            },
            enabled = !isValidating,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isValidating) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp))
            } else {
                Text("Validate")
            }
        }
        
        if (errors.isNotEmpty()) {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    errors.forEach { error ->
                        Text(
                            text = error,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
            }
        }
    }
}
```

## Features

- ✅ Address validation
- ✅ Address normalization
- ✅ PID encoding
- ✅ Kotlin coroutines support
- ✅ Jetpack Compose ready
- ✅ Android 5.0+ support

## License

MIT
