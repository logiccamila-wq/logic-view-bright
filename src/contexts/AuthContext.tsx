useEffect(() => {
  let mounted = true;

  // Listener de auth
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (!mounted) return;

    setSession(session);
    setUser(session?.user ?? null);

    if (event === "SIGNED_OUT") {
      setRoles([]);
      setLoading(false);
      return;
    }

    if (session?.user) {
      setLoading(true);
      setTimeout(() => fetchUserRoles(session.user.id), 0);
    } else {
      setRoles([]);
      setLoading(false);
    }
  });

  // Verificar sessão existente
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!mounted) return;

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      setLoading(true);
      setTimeout(() => fetchUserRoles(session.user.id), 0);
    } else {
      setLoading(false);
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);
