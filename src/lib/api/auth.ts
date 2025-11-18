export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro no registro");
  return data;
}

export async function loginUser(formData: {
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro no login");
  return data;
}
