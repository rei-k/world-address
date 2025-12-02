// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "VeySDK",
    platforms: [
        .iOS(.v13),
        .macOS(.v10_15)
    ],
    products: [
        .library(
            name: "VeySDK",
            targets: ["VeySDK"]),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "VeySDK",
            dependencies: []),
        .testTarget(
            name: "VeySDKTests",
            dependencies: ["VeySDK"]),
    ]
)
