<?php

namespace Vey\Laravel;

use Illuminate\Support\ServiceProvider;
use Vey\VeyClient;

class VeyServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(VeyClient::class, function ($app) {
            return new VeyClient(
                config('vey.api_key'),
                config('vey.api_endpoint', 'https://api.vey.example')
            );
        });
    }

    public function boot()
    {
        $this->publishes([
            __DIR__.'/../../config/vey.php' => config_path('vey.php'),
        ], 'config');
    }
}
