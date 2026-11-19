@extends('layout')
@section('title', 'Register')
@section('content')
<form method="POST" action="{{ route('register') }}" class="card form">
    @csrf
    <h1>Create an account</h1>
    @include('auth._oauth')
    <label>Name <input name="name" value="{{ old('name') }}" required autofocus maxlength="50"></label>
    @error('name')<p class="error">{{ $message }}</p>@enderror
    <label>Email <input type="email" name="email" value="{{ old('email') }}" required></label>
    @error('email')<p class="error">{{ $message }}</p>@enderror
    <label>Password <input type="password" name="password" required minlength="8"></label>
    @error('password')<p class="error">{{ $message }}</p>@enderror
    <label>Confirm password <input type="password" name="password_confirmation" required></label>
    <button class="btn">Register</button>
    <p class="small">Already registered? <a href="{{ route('login') }}">Log in</a></p>
</form>
@endsection
