"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from '@/utils/firebase';
import { useRouter } from "next/navigation";

export default function LoginPage(){
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")

    const handleLogin = async(e:React.FormEvent) =>{
        e.preventDefault();
        if(!email || !password){
            setError("Please, enter email and password");
            return;
        }
        try{
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        }catch(error:any){
            alert(error.message);
        }
    };

    return(
        <main className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {error && (
                <p className="text-red-500 mb-2 text-sm">{error}</p>
            )}
            <form onSubmit={handleLogin} className="flex flex-col w-64 gap-4">
                <input type="email"
                placeholder="Email"
                className="border p-2"
                value={email}
                onChange={(e)=>setEmail(e.target.value)} />
                <input type="password"
                placeholder="Password"
                className="border p-2"
                value={password}
                onChange={(e)=>setPassword(e.target.value)} />
                <button className="bg-green-500 text-white py-2" type="submit">
                    Login
                </button>
            </form>
        </main>
    );
}