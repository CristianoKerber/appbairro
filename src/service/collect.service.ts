import { useEffect } from "react";

export default function Collect(){
    const [user, setUser] = useState([]);
    
    useEffect(( ) => {
        fetch("API")
        .then(res => res.json())
        .then(data)
    })
}