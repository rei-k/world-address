# VeySDK (iOS)

Swift SDK for World Address YAML - Address validation and formatting for iOS and macOS applications.

## Installation

### Swift Package Manager

Add the following to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/rei-k/world-address-yaml.git", from: "1.0.0")
]
```

Or in Xcode:
1. File > Add Packages...
2. Enter the repository URL
3. Select version

## Usage

### Initialize the Client

```swift
import VeySDK

let veyClient = VeyClient(apiKey: "your-api-key")
```

### Validate an Address

```swift
let address = Address(
    street: "1-1 Chiyoda",
    city: "Tokyo",
    postalCode: "100-0001"
)

veyClient.validateAddress(address, countryCode: "JP") { result in
    switch result {
    case .success(let validation):
        if validation.valid {
            print("Address is valid!")
        } else {
            print("Errors: \(validation.errors)")
        }
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

### Normalize an Address

```swift
veyClient.normalizeAddress(address, countryCode: "JP") { result in
    switch result {
    case .success(let normalized):
        print("Normalized: \(normalized.street ?? "")")
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

### Encode PID

```swift
let pid = veyClient.encodePID(components: [
    "country": "JP",
    "admin1": "13",
    "admin2": "113"
])
print(pid) // "JP-13-113"
```

## SwiftUI Integration

```swift
import SwiftUI
import VeySDK

struct AddressFormView: View {
    @State private var address = Address()
    @State private var isValidating = false
    @State private var errors: [String] = []
    
    let veyClient = VeyClient(apiKey: "your-api-key")
    
    var body: some View {
        Form {
            TextField("Street", text: $address.street ?? "")
            TextField("City", text: $address.city ?? "")
            TextField("Postal Code", text: $address.postalCode ?? "")
            
            Button("Validate") {
                validateAddress()
            }
            .disabled(isValidating)
            
            if !errors.isEmpty {
                Section {
                    ForEach(errors, id: \.self) { error in
                        Text(error).foregroundColor(.red)
                    }
                }
            }
        }
    }
    
    func validateAddress() {
        isValidating = true
        errors = []
        
        veyClient.validateAddress(address, countryCode: "JP") { result in
            isValidating = false
            
            switch result {
            case .success(let validation):
                if !validation.valid {
                    errors = validation.errors
                }
            case .failure(let error):
                errors = [error.localizedDescription]
            }
        }
    }
}
```

## Features

- ✅ Address validation
- ✅ Address normalization
- ✅ PID encoding
- ✅ iOS 13+ support
- ✅ macOS 10.15+ support
- ✅ Swift Package Manager
- ✅ SwiftUI ready

## License

MIT
