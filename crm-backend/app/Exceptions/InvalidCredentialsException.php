<?php

namespace App\Exceptions;

use Exception;

class InvalidCredentialsException extends Exception
{
    protected $message = 'Invalid email or password.';
    protected $code = 401;
}
