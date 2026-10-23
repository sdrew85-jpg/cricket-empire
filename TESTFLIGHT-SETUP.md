# Apple TestFlight setup

This guide takes Cricket Empire from the project ZIP to an iPhone build in TestFlight. The app is set to version **0.9.3** and bundle ID **`com.cricketempire.game`**.

## 1. Join Apple Developer Program

An active Apple Developer Program membership is required to sign and distribute an iOS app through TestFlight. Enroll with the Apple Account you will use for App Store Connect. Apple lists the program and enrollment details [here](https://developer.apple.com/programs/).

## 2. Register the app identifier

In [Apple Developer](https://developer.apple.com/help/account/identifiers/register-an-app-id), create an explicit **App ID** for `com.cricketempire.game`. This app currently needs no special capabilities. If that identifier is already taken in your account, choose another unique ID before the first upload and replace it in `app.json`, `ios/CricketEmpireNative.xcodeproj/project.pbxproj`, and `codemagic.yaml`.

## 3. Create the App Store Connect app record

In [App Store Connect](https://appstoreconnect.apple.com/), open **Apps → + → New App**. Choose iOS, enter **Cricket Empire**, select the bundle ID from step 2, choose a primary language, and enter a unique SKU such as `cricket-empire-ios`. Apple requires this app record before Codemagic can upload builds. [Apple’s app-record instructions](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/)

## 4. Give Codemagic an Apple API key

In App Store Connect, go to **Users and Access → Integrations → App Store Connect API** and create a key with **App Manager** access. Download its `.p8` private key and note the **Issuer ID** and **Key ID**. Apple only allows the private key to be downloaded once.

In Codemagic, open **Team settings → Team integrations → Developer Portal → Manage keys** and add the key. Use the name `cricket_empire_app_store_connect` so it matches the project workflow. Enter the Issuer ID and Key ID, and upload the `.p8` file directly to Codemagic. Do not put the private key in GitHub or send it in chat. [Codemagic’s React Native iOS setup](https://docs.codemagic.io/yaml-quick-start/building-a-react-native-app/)

## 5. Set up iOS signing in Codemagic

In **Team settings → codemagic.yaml settings → Code signing identities**, create or upload an **Apple Distribution** certificate. Then fetch or upload an **App Store** provisioning profile for `com.cricketempire.game`. The certificate and profile must match the app identifier. The YAML already requests App Store signing and applies the profile before building.

## 6. Connect GitHub and start the build

Publish the project folder from the ZIP to GitHub, then in Codemagic choose **Add application**, connect GitHub, and select the repository. Codemagic reads `codemagic.yaml` from the project root. Select the `ios-testflight` workflow and start a build. It installs packages, runs the game tests, builds the signed iOS app, and uploads it to App Store Connect.

## 7. Invite testers

After Apple processes the uploaded build, open the app’s **TestFlight** tab in App Store Connect. Complete the beta test information and any export-compliance questions Apple shows. Add internal testers from your App Store Connect team, or create an external tester group and invite people by email or public link. Apple allows up to 100 internal testers; the first build sent to external testers goes through TestFlight App Review. Testers install Apple’s free TestFlight app on their iPhones and accept your invitation. [Apple’s TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)

## What is already configured

- Native React Native iOS project; Expo is not required.
- App name, icon, Bebas Neue font, and bundle ID.
- Codemagic workflow for signed TestFlight builds.
- GitHub Actions workflow for running the game tests.

You still need your Apple Developer membership, App Store Connect app record/API key, code-signing setup, and GitHub/Codemagic connection before the first cloud build can run.
