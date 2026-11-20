# Apple TestFlight setup

This guide takes Cricket Empire from GitHub to an iPhone build in internal TestFlight. The app is set to version **0.9.5** and bundle ID **`com.cricketempire.game`**.

## 1. Join Apple Developer Program

An active Apple Developer Program membership is required to sign and distribute an iOS app through TestFlight. Enroll with the Apple Account you will use for App Store Connect. Apple lists the program and enrollment details [here](https://developer.apple.com/programs/).

## 2. Register the app identifier

In [Apple Developer](https://developer.apple.com/help/account/identifiers/register-an-app-id), create an explicit **App ID** for `com.cricketempire.game`. This app currently needs no special capabilities. If that identifier is already taken in your account, choose another unique ID before the first upload and replace it in `ios/CricketEmpireNative.xcodeproj/project.pbxproj` and the GitHub Actions workflow.

## 3. Create the App Store Connect app record

In [App Store Connect](https://appstoreconnect.apple.com/), open **Apps → + → New App**. Choose iOS, enter **Cricket Empire**, select the bundle ID from step 2, choose a primary language, and enter a unique SKU. Apple requires this app record before GitHub Actions can upload builds. [Apple’s app-record instructions](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/)

## 4. Prepare Apple signing and upload credentials

In App Store Connect, go to **Users and Access → Integrations → App Store Connect API** and create a key with **App Manager** access. Download its `.p8` private key and note the **Issuer ID** and **Key ID**. Apple only allows the private key to be downloaded once.

Keep the `.p8` file, Issuer ID, and Key ID for the GitHub Actions secrets in the next step. Do not commit them or send them in chat.

## 5. Prepare iOS signing files

Create or download an **Apple Distribution** certificate as a `.p12` file and an **App Store** provisioning profile for `com.cricketempire.game`. They must use the same Apple Developer team and match the bundle identifier.

## 6. Add GitHub Actions secrets

In `sdrew85-jpg/cricket-empire`, open **Settings → Secrets and variables → Actions**. Add these repository secrets:

- `IOS_DISTRIBUTION_CERTIFICATE_BASE64` — the `.p12` certificate encoded as Base64.
- `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` — the certificate password.
- `IOS_PROVISIONING_PROFILE_BASE64` — the `.mobileprovision` profile encoded as Base64.
- `APP_STORE_CONNECT_API_KEY_ID` — the Key ID.
- `APP_STORE_CONNECT_ISSUER_ID` — the Issuer ID.
- `APP_STORE_CONNECT_API_KEY_P8` — the contents of the `.p8` file.

Then add the repository variable `ENABLE_TESTFLIGHT_DEPLOY` and set it to `true`. Until this variable is enabled, GitHub Actions runs the game tests but skips signing and uploading an iOS build.

## 7. Build with GitHub Actions

The **Verify Cricket Empire** workflow runs tests on pushes and pull requests. When a tested change reaches `main` and the deployment variable is enabled, GitHub Actions signs the app, builds an IPA, and uploads an **Internal Only** TestFlight build. It does not submit builds for external beta review or App Store release. The IPA is also available in the workflow run’s artifacts.

## 8. Invite testers

After Apple processes the uploaded build, open the app’s **TestFlight** tab in App Store Connect and add the build to an internal testing group. Internal testers must be App Store Connect users with access to your app. Builds are marked **Internal Only** and are not submitted for external beta review. Testers install Apple’s free TestFlight app on their iPhones and accept your invitation. [Apple’s TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)

## What is already configured

- Native React Native iOS project; Expo is not required.
- App name, icon, Bebas Neue font, and bundle ID.
- GitHub Actions workflow for tests and internal-only TestFlight uploads.
- Codemagic push builds are disabled to prevent duplicate uploads.

You still need the Apple signing files, App Store Connect API key, GitHub Actions secrets, and `ENABLE_TESTFLIGHT_DEPLOY=true` before GitHub can build and upload an IPA. After processing, add the build to an internal testing group in App Store Connect; internal testers must have App Store Connect access to the app.
