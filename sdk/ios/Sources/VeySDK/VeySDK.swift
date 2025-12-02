import Foundation

public struct Address: Codable {
    public var street: String?
    public var city: String?
    public var province: String?
    public var postalCode: String?
    public var country: String?
    
    public init(
        street: String? = nil,
        city: String? = nil,
        province: String? = nil,
        postalCode: String? = nil,
        country: String? = nil
    ) {
        self.street = street
        self.city = city
        self.province = province
        self.postalCode = postalCode
        self.country = country
    }
}

public struct ValidationResult: Codable {
    public let valid: Bool
    public let errors: [String]
    
    public init(valid: Bool, errors: [String] = []) {
        self.valid = valid
        self.errors = errors
    }
}

public class VeyClient {
    private let apiKey: String
    private let apiEndpoint: String
    private let session: URLSession
    
    public init(apiKey: String, apiEndpoint: String = "https://api.vey.example") {
        self.apiKey = apiKey
        self.apiEndpoint = apiEndpoint
        self.session = URLSession.shared
    }
    
    public func validateAddress(
        _ address: Address,
        countryCode: String,
        completion: @escaping (Result<ValidationResult, Error>) -> Void
    ) {
        guard let url = URL(string: "\(apiEndpoint)/validate") else {
            completion(.failure(NSError(domain: "VeySDK", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        
        let body: [String: Any] = [
            "address": try! JSONEncoder().encode(address),
            "countryCode": countryCode
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "VeySDK", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                return
            }
            
            do {
                let result = try JSONDecoder().decode(ValidationResult.self, from: data)
                completion(.success(result))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    public func normalizeAddress(
        _ address: Address,
        countryCode: String,
        completion: @escaping (Result<Address, Error>) -> Void
    ) {
        guard let url = URL(string: "\(apiEndpoint)/normalize") else {
            completion(.failure(NSError(domain: "VeySDK", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        
        let body: [String: Any] = [
            "address": try! JSONEncoder().encode(address),
            "countryCode": countryCode
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "VeySDK", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                return
            }
            
            do {
                let result = try JSONDecoder().decode(Address.self, from: data)
                completion(.success(result))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    public func encodePID(components: [String: String]) -> String {
        var parts: [String] = []
        
        if let country = components["country"] { parts.append(country) }
        if let admin1 = components["admin1"] { parts.append(admin1) }
        if let admin2 = components["admin2"] { parts.append(admin2) }
        if let locality = components["locality"] { parts.append(locality) }
        
        return parts.joined(separator: "-")
    }
}
