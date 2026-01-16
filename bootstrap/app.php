<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle API exceptions with JSON responses
        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $status = 500;
                $message = 'An unexpected error occurred.';
                
                if ($e instanceof ValidationException) {
                    return response()->json([
                        'message' => 'Validation failed.',
                        'errors' => $e->errors()
                    ], 422);
                }
                
                if ($e instanceof ModelNotFoundException) {
                    $status = 404;
                    $message = 'Resource not found.';
                }
                
                if ($e instanceof NotFoundHttpException) {
                    $status = 404;
                    $message = 'Endpoint not found.';
                }
                
                if ($e instanceof HttpException) {
                    $status = $e->getStatusCode();
                    $message = $e->getMessage() ?: $message;
                }
                
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    $status = 401;
                    $message = 'Unauthenticated.';
                }
                
                if ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    $status = 403;
                    $message = 'Unauthorized action.';
                }
                
                $response = ['message' => $message];
                
                // Include error details in non-production environments
                if (config('app.debug')) {
                    $response['error'] = $e->getMessage();
                    $response['file'] = $e->getFile();
                    $response['line'] = $e->getLine();
                    $response['trace'] = $e->getTraceAsString();
                }
                
                return response()->json($response, $status);
            }
        });
    })->create();
