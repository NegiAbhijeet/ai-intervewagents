import Firebase
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "AiInterviewAgents",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // MARK: - URL Handling for OAuth Redirects
  
  /// Handle URLs for OAuth redirect callbacks (iOS 9+)
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    // Check if this is a Google Sign-In redirect
    if url.scheme == "com.googleusercontent.apps.611623329833-7sv354bekagp8fugq047qg8q96cpf29a" {
      print("🔐 [AppDelegate] Received OAuth redirect URL: \(url)")
      return true
    }
    
    // Let React Native handle other URLs
    return false
  }

  /// Handle Scene-based URL opening (iOS 13+)
  func scene(
    _ scene: UIScene,
    openURLContexts URLContexts: Set<UIOpenURLContext>
  ) {
    for context in URLContexts {
      let url = context.url
      if url.scheme == "com.googleusercontent.apps.611623329833-7sv354bekagp8fugq047qg8q96cpf29a" {
        print("🔐 [AppDelegate] Scene received OAuth redirect URL: \(url)")
      }
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
