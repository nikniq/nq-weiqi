@extends('layout')
@section('title', 'Login')
@section('content')
<form method="POST" action="{{ route('login') }}" class="card form">
    @csrf
    <h1>Log in</h1>
    @include('auth._oauth')
    <label>Email <input type="email" name="email" value="{{ old('email') }}" required autofocus></label>
    @error('email')<p class="error">{{ $message }}</p>@enderror
    <label>Password <input type="password" name="password" required></label>
    <label class="check"><input type="checkbox" name="remember"> Remember me</label>
    <button class="btn">Log in</button>
    <p class="small">No account? <a href="{{ route('register') }}">Register</a></p>
</form>
@endsection
