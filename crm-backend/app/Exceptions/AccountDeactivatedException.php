<?php

namespace App\Exceptions;

use Exception;

class AccountDeactivatedException extends Exception
{
    protected $message = 'Your account has been deactivated. Please contact support.';
    protected $code = 403;
}
