import React, { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Linking
} from "react-native"
// import { Eye, EyeOff } from "lucide-react-native"

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { useNavigation } from "@react-navigation/native"
import { AppStateContext } from "../components/AppContext"
import fetchWithAuth from "../libs/fetchWithAuth"
import { API_URL } from "../components/config"
import Toast from "react-native-toast-message"


const SignupScreen = ({ setActiveTab }) => {
  const { setUserProfile, userProfile } = useContext(AppStateContext)
  const navigation = useNavigation()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [cPassword, setCPassword] = useState("")
  const [termsCheckbox, setTermsCheckbox] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailSignupLoading, setIsEmailSignupLoading] = useState(false)
  const [isGoogleSignupLoading, setIsGoogleSignupLoading] = useState(false)

  const isFormValid =
    fullName.trim() !== "" &&
    email.trim() !== "" &&
    password !== "" &&
    cPassword !== "" &&
    termsCheckbox

  const handleSubmit = async () => {
    if (password !== cPassword) {
    //   Toast.error("Passwords do not match")
      return
    }

    try {
      setIsEmailSignupLoading(true)
      const [first_name, ...last] = fullName.trim().split(" ")
      const last_name = last.join(" ")

      const payload = {
        email,
        password,
        first_name,
        last_name,
        uid: userProfile?.uid
      }

      const res = await fetchWithAuth(`${API_URL}/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create profile")

    //   toast.success("Account created successfully.")
      setActiveTab("login")
    } catch (err) {
      console.error(err)
    //   toast.error(err.message || "Signup error.")
    } finally {
      setIsEmailSignupLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      setIsGoogleSignupLoading(true)

      const signedInUser = result.user
      const token = await signedInUser.getIdToken()
      const displayName = signedInUser.displayName || ""
      const [first_name, ...last] = displayName.trim().split(" ")
      const last_name = last.join(" ")

      const response = await fetchWithAuth(`${API_URL}/profiles/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: signedInUser.uid,
          email: signedInUser.email,
          first_name,
          last_name,
          plan: 1,
          image_url: signedInUser?.photoURL,
          role: ""
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || "Failed to create profile")
      }

      await fetchUserDetails(signedInUser, setUserProfile, navigation)
    } catch (error) {
      console.error("Google sign-in error:", error)
      setIsGoogleSignupLoading(false)
    //   toast.error(error.message || "Login failed.")
      await signOut(auth)
    }
  }

  return (
    <View className="px-6 py-8 bg-white rounded-lg shadow-md">
      <Text className="text-2xl font-bold mb-1">Sign Up</Text>
      <Text className="text-gray-500 mb-4">Create a new account to get started</Text>

      {/* Full Name */}
      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium">Full Name</Text>
        <TextInput
          className="bg-gray-100 p-3 rounded-md"
          placeholder="Full name here"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Email */}
      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium">Email</Text>
        <TextInput
          className="bg-gray-100 p-3 rounded-md"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password */}
      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium">Password</Text>
        <View className="relative">
          <TextInput
            className="bg-gray-100 p-3 pr-10 rounded-md"
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            className="absolute right-3 top-3"
            onPress={() => setShowPassword(!showPassword)}
          >
            {/* {showPassword ? (
              <EyeOff size={20} color="#555" />
            ) : (
              <Eye size={20} color="#555" />
            )} */}
          </Pressable>
        </View>
        <Text className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</Text>
      </View>

      {/* Confirm Password */}
      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium">Confirm Password</Text>
        <TextInput
          className="bg-gray-100 p-3 rounded-md"
          secureTextEntry={!showPassword}
          placeholder="••••••••"
          value={cPassword}
          onChangeText={setCPassword}
        />
      </View>

      {/* Terms Checkbox */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          className="h-5 w-5 border border-gray-400 rounded mr-2 items-center justify-center"
          onPress={() => setTermsCheckbox(!termsCheckbox)}
        >
          {termsCheckbox && <Text>✓</Text>}
        </TouchableOpacity>
        <Text className="text-sm text-gray-600">
          I agree to the{" "}
          <Text className="text-blue-600" onPress={() => Linking.openURL("#")}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text className="text-blue-600" onPress={() => Linking.openURL("#")}>
            Privacy Policy
          </Text>
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`w-full p-3 rounded-md items-center justify-center ${
          !isFormValid || isEmailSignupLoading || isGoogleSignupLoading
            ? "bg-gray-300"
            : "bg-gradient-to-r from-blue-400/60 to-pink-500/70"
        }`}
        disabled={!isFormValid || isEmailSignupLoading || isGoogleSignupLoading}
        onPress={handleSubmit}
      >
        {isEmailSignupLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="px-2 text-gray-500 text-xs uppercase">Or continue with</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Google Signup */}
      <TouchableOpacity
        className="flex-row items-center justify-center w-full bg-white border border-gray-300 rounded-md p-3"
        onPress={loginWithGoogle}
        disabled={isGoogleSignupLoading || isEmailSignupLoading}
      >
        {isGoogleSignupLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text className="mr-2">🌐</Text>
            <Text className="text-sm font-medium text-gray-700">Google</Text>
          </>
        )}
      </TouchableOpacity>
      
            <Toast />
    </View>
  )
}

export default SignupScreen
